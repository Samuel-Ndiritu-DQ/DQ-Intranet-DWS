import React, { useEffect, useState } from 'react';
import { DocumentDashboard } from './DocumentDashboard';
import { DocumentTable } from './DocumentTable';
import { DocumentUpload } from './DocumentUpload';
import { DocumentDetail } from './DocumentDetail';
import { SearchIcon, FilterIcon, XIcon, FolderIcon, UploadCloudIcon, AwardIcon } from 'lucide-react';
import { getEmployeeDocuments, deleteDocument } from '../../services/employeeOnboardingService';
import { useMsal } from "@azure/msal-react";

export function DocumentWallet({
    activeTab = 'my-documents',
    setActiveTab
}: {
    activeTab?: 'my-documents' | 'uploads' | 'certificates';
    setActiveTab?: (tab: 'my-documents' | 'uploads' | 'certificates') => void;
}) {
    const { accounts } = useMsal();
    const account = accounts[0];
    const employeeId = account?.localAccountId || account?.username || "";

    const [documents, setDocuments] = useState<any[]>([]);
    // If props are provided, use them, otherwise use internal state for backward compatibility
    const [internalActiveTab, setInternalActiveTab] = useState<'my-documents' | 'uploads' | 'certificates'>('my-documents');
    const currentTab = setActiveTab ? activeTab : internalActiveTab;

    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [preSelectedDocType, setPreSelectedDocType] = useState<string | undefined>(undefined);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const REQUIRED_DOCS = [
        { name: 'National ID', category: 'Id', fieldName: 'national_id' },
        { name: 'Degree Certificate', category: 'Certificate', fieldName: 'degree_certificate' },
        { name: 'Employment Contract', category: 'Contract', fieldName: 'employment_contract' }
    ];

    // Function to fetch documents
    const fetchDocs = async () => {
        if (!employeeId) return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await getEmployeeDocuments(employeeId);

            // Transform database fields to UI fields
            const uploadedDocs = data.map(doc => ({
                ...doc,
                name: doc.file_name,
                category: getCategoryFromFieldName(doc.field_name),
                uploadDate: doc.created_at,
                expiryDate: null,
                status: 'Uploaded',
                fileType: doc.file_type.includes('pdf') ? 'pdf' : doc.file_type.includes('image') ? 'image' : 'file',
            }));

            // Get field names of uploaded docs
            const uploadedFieldNames = data.map(d => d.field_name.toLowerCase());

            // Identify missing required docs
            const missingDocs = REQUIRED_DOCS.filter(req =>
                !uploadedFieldNames.includes(req.fieldName)
            ).map(missing => ({
                id: `missing-${missing.fieldName}`,
                name: missing.name,
                category: missing.category,
                status: 'Required',
                isMissing: true,
                fileType: 'none',
                fieldName: missing.fieldName
            }));

            const allDocs = [...missingDocs, ...uploadedDocs];
            setDocuments(allDocs);
            setFilteredDocuments(allDocs);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load documents. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get category label from field_name
    const getCategoryFromFieldName = (fieldName: string): string => {
        const lower = fieldName.toLowerCase();
        if (lower.includes('id') || lower.includes('passport')) return 'Id';
        if (lower.includes('cert') || lower.includes('degree')) return 'Certificate';
        if (lower.includes('contract')) return 'Contract';
        if (lower.includes('letter')) return 'Letter';
        return 'Other';
    };

    // Fetch documents from Supabase
    useEffect(() => {
        fetchDocs();
    }, [employeeId]);
    // Filter documents based on active tab, search term, and status
    useEffect(() => {
        let filtered = documents;

        // Apply Tab Filter
        if (currentTab === 'uploads') {
            // Uploads & Validation: Focus on pending/recent uploads (exclude virtual missing docs)
            filtered = filtered.filter(doc => !doc.isMissing && ['Uploaded', 'Reviewed'].includes(doc.status));
        } else if (currentTab === 'certificates') {
            // Certificates & Credentials
            filtered = filtered.filter(doc => doc.category === 'Certificate');
        } else {
            // My Documents: Approved, General, or Required placeholders
            filtered = filtered.filter(doc =>
                doc.isMissing ||
                doc.status === 'Approved' ||
                doc.status === 'Required' ||
                (doc.category !== 'Certificate' && doc.status !== 'Rejected')
            );
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (doc) =>
                    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // ... (remaining status filters if needed)
        setFilteredDocuments(filtered);
    }, [searchTerm, activeFilter, documents, statusFilter, currentTab]);
    // Get expiring documents (within 30 days)
    const expiringDocuments = documents.filter((doc) => {
        if (!doc.expiryDate) return false;
        const today = new Date();
        const expiry = new Date(doc.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    });
    // Calculate document statistics
    const documentStats = {
        total: documents.length,
        active: documents.filter((doc) => doc.status === 'Active').length,
        expiring: expiringDocuments.length,
        expired: documents.filter((doc) => {
            if (!doc.expiryDate) return false;
            const today = new Date();
            const expiry = new Date(doc.expiryDate);
            return expiry < today || doc.status === 'Expired';
        }).length,
    };
    // Handle filter by status from dashboard cards
    const handleFilterByStatus = (status: any) => {
        // Toggle filter if clicking the same status again
        setStatusFilter(statusFilter === status ? null : status);
    };
    // Get unique categories for filter
    const categories = ['all', ...new Set(documents.map((doc) => doc.category))];
    // Handle document upload - refresh from database
    const handleDocumentUpload = (newDocument: any) => {
        // Refresh the document list from the database to get accurate state
        fetchDocs();
        setIsUploadModalOpen(false);
    };
    // Handle document replacement
    const handleDocumentReplace = (docId: string, newVersion: any) => {
        setDocuments(
            documents.map((doc) => {
                if (doc.id === docId) {
                    // Add current version to version history
                    const updatedVersions = [
                        ...(doc.versions || []),
                        {
                            versionNumber: doc.versions ? doc.versions.length + 1 : 1,
                            uploadDate: doc.uploadDate,
                            uploadedBy: doc.uploadedBy,
                            notes: 'Previous version',
                            fileUrl: doc.fileUrl,
                        },
                    ];
                    return {
                        ...doc,
                        ...newVersion,
                        versions: updatedVersions,
                        uploadDate: new Date().toISOString().split('T')[0],
                    };
                }
                return doc;
            }),
        );
        setSelectedDocument(null);
    };
    const handleDocumentDelete = async (docId: string) => {
        try {
            const docToDelete = documents.find((doc) => doc.id === docId);
            if (!docToDelete || docToDelete.isMissing) {
                // If it's a virtual missing doc, just ignore or handle specially
                return;
            }

            const result = await deleteDocument(docId, docToDelete.file_path);
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete document');
            }

            // Update state to remove the document
            setDocuments(documents.filter((doc) => doc.id !== docId));
            setSelectedDocument(null);
        } catch (error) {
            console.error('Error deleting document:', error);
            // Fallback: still remove from UI if it was a virtual document or already gone
            setDocuments(documents.filter((doc) => doc.id !== docId));
            setSelectedDocument(null);
        }
    };
    // Toggle filter expansion for mobile
    const toggleFilterExpansion = () => {
        setIsFilterExpanded(!isFilterExpanded);
    };
    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48 bg-white rounded-lg p-4">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading documents...</p>
                </div>
            </div>
        );
    }
    // Error state
    return (
        <div className="bg-white">
            {/* Dashboard Summary - 2x2 grid on mobile */}
            <div className="px-4 md:px-6 pt-4 md:pt-6">
                <DocumentDashboard
                    stats={documentStats}
                    onFilterByStatus={handleFilterByStatus}
                    activeFilter={statusFilter}
                />
            </div>

            {/* Search and Filters - Compact for mobile */}
            <div className="px-4 md:px-6 pt-4">
                <div className="md:flex md:flex-row md:gap-4 md:items-center">
                    {/* Mobile Search with Filter Toggle */}
                    <div className="relative flex-1 mb-4 md:mb-0">
                        <div className="flex items-center">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <SearchIcon size={18} />
                                </div>
                            </div>
                            <button
                                className="ml-3 p-3 text-gray-500 border border-gray-300 rounded-md md:hidden"
                                onClick={toggleFilterExpansion}
                                aria-label="Toggle filters"
                            >
                                <FilterIcon size={18} />
                            </button>
                        </div>
                        {/* Mobile Expanded Filter */}
                        {isFilterExpanded && (
                            <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 p-4 md:hidden">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-gray-700">
                                        Filters
                                    </span>
                                    <button
                                        onClick={toggleFilterExpansion}
                                        className="p-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <XIcon size={16} />
                                    </button>
                                </div>
                                <label className="block text-sm text-gray-500 mb-2">
                                    Category:
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                                    value={activeFilter}
                                    onChange={(e) => {
                                        setActiveFilter(e.target.value);
                                        setIsFilterExpanded(false);
                                    }}
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category === 'all' ? 'All Categories' : category}
                                        </option>
                                    ))}
                                </select>
                                {(searchTerm || activeFilter !== 'all' || statusFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setActiveFilter('all');
                                            setStatusFilter(null);
                                            setIsFilterExpanded(false);
                                        }}
                                        className="w-full py-3 text-sm text-blue-600 border border-blue-300 rounded-md bg-blue-50 hover:bg-blue-100"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Desktop Filter */}
                    <div className="hidden md:flex md:items-center md:gap-3">
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                            <FilterIcon size={16} className="inline mr-1" /> Filter:
                        </span>
                        <select
                            className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {filteredDocuments.length === 0 && (
                <div className="mx-4 md:mx-6 my-4 md:my-6 text-center py-10 md:py-12 border border-gray-200 rounded-lg">
                    <div className="text-gray-400 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No documents found
                    </h3>
                    <p className="text-gray-500 mb-5 px-6 max-w-md mx-auto">
                        {searchTerm || activeFilter !== 'all' || statusFilter
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : 'Upload your first document to get started.'}
                    </p>
                    {searchTerm || activeFilter !== 'all' || statusFilter ? (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setActiveFilter('all');
                                setStatusFilter(null);
                            }}
                            className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Clear all filters
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Upload a document
                        </button>
                    )}
                </div>
            )}

            {/* Document Table */}
            {filteredDocuments.length > 0 && (
                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2">
                    <DocumentTable
                        documents={filteredDocuments}
                        onViewDocument={setSelectedDocument}
                        onUploadDocument={(docType) => {
                            setPreSelectedDocType(docType);
                            setIsUploadModalOpen(true);
                        }}
                    />
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <DocumentUpload
                    onClose={() => {
                        setIsUploadModalOpen(false);
                        setPreSelectedDocType(undefined);
                    }}
                    onUpload={handleDocumentUpload}
                    categories={categories.filter((c) => c !== 'all')}
                    preSelectedDocType={preSelectedDocType}
                />
            )}

            {/* Document Detail Modal */}
            {selectedDocument && (
                <DocumentDetail
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                    onReplace={handleDocumentReplace}
                    onDelete={handleDocumentDelete}
                />
            )}
        </div>
    );
}
