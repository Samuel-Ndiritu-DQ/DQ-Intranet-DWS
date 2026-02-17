import { ServiceRequestStatus } from '../../types';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface StatusBadgeProps {
    status: ServiceRequestStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusConfig = (s: string) => {
        switch (s.toLowerCase()) {
            case 'draft':
                return {
                    label: 'Draft',
                    styles: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: FileText
                };
            case 'under-review':
            case 'pending':
                return {
                    label: 'Under Review',
                    styles: 'bg-blue-50 text-blue-700 border-blue-100',
                    icon: Clock
                };
            case 'approved':
            case 'resolved':
                return {
                    label: s === 'resolved' ? 'Resolved' : 'Approved',
                    styles: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: CheckCircle2
                };
            case 'rejected':
                return {
                    label: 'Rejected',
                    styles: 'bg-rose-50 text-rose-700 border-rose-100',
                    icon: XCircle
                };
            default:
                return {
                    label: s,
                    styles: 'bg-gray-50 text-gray-700 border-gray-100',
                    icon: Clock
                };
        }
    };

    const config = getStatusConfig(status as string);
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.styles}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}
