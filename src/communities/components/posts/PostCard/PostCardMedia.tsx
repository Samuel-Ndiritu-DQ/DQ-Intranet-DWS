import React, { useEffect, useState } from 'react';
import { BasePost, MediaFile } from '../types';
import { supabase } from "@/lib/supabaseClient";
import { ImageIcon, Video, FileImage } from 'lucide-react';
interface PostCardMediaProps {
  post: BasePost;
}
export const PostCardMedia: React.FC<PostCardMediaProps> = ({
  post
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Extract media from post content (primary method for posts_v2 since media_files references posts table)
  const extractMediaFromContent = () => {
    const content = (post as any).content || '';
    console.log('🔵 PostCardMedia: Extracting media from content', {
      postId: post.id,
      contentLength: content.length,
      contentPreview: content.substring(0, 200)
    });
    
    if (!content) {
      console.log('⚠️ PostCardMedia: No content to extract from');
      setLoading(false);
      return false;
    }
    
    // Check for media HTML in content (format: <div class="media-content">...</div>)
    // Use more flexible regex to match variations
    const mediaDivMatch = content.match(/<div[^>]*class\s*=\s*["']media-content["'][^>]*>(.*?)<\/div>/is);
    if (mediaDivMatch) {
      const mediaHtml = mediaDivMatch[1];
      console.log('🔵 PostCardMedia: Found media-content div', { mediaHtml: mediaHtml.substring(0, 100) });
      
      // Try to find img tag with src attribute (more flexible regex)
      const imgMatch = mediaHtml.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i) || 
                       mediaHtml.match(/<img[^>]+src\s*=\s*([^\s>]+)/i);
      
      if (imgMatch) {
        const mediaUrl = imgMatch[1].trim();
        console.log('✅ PostCardMedia: Found image URL in content:', mediaUrl);
        
        // Determine file type from URL or default to image
        const fileType = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video/mp4' : 
                        mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/jpeg' : 'image/jpeg';
        
        // Extract caption if present
        const captionMatch = mediaHtml.match(/<p[^>]*>([^<]+)<\/p>/i);
        
        setMediaFiles([{
          id: 'content-media',
          file_url: mediaUrl,
          file_type: fileType,
          caption: captionMatch ? captionMatch[1].trim() : null,
          display_order: 0
        } as MediaFile]);
        setLoading(false);
        return true;
      } else {
        console.log('⚠️ PostCardMedia: Found media-content div but no img tag inside');
      }
    }
    
    // Also check for direct img tags in content (fallback - check anywhere in content)
    const directImgMatch = content.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i) || 
                           content.match(/<img[^>]+src\s*=\s*([^\s>]+)/i);
    if (directImgMatch) {
      const mediaUrl = directImgMatch[1].trim();
      console.log('✅ PostCardMedia: Found direct img tag in content:', mediaUrl);
      
      const fileType = mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video/mp4' : 
                      mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/jpeg' : 'image/jpeg';
      
      setMediaFiles([{
        id: 'content-media',
        file_url: mediaUrl,
        file_type: fileType,
        caption: null,
        display_order: 0
      } as MediaFile]);
      setLoading(false);
      return true;
    }
    
    console.log('⚠️ PostCardMedia: No media found in content');
    setLoading(false);
    return false;
  };
  
  useEffect(() => {
    fetchMediaFiles();
  }, [post.id]);
  
  const fetchMediaFiles = async () => {
    try {
      console.log('🔵 PostCardMedia: Fetching media for post', post.id);
      
      // First, try to extract from content (this is the primary method for posts_v2)
      const extracted = extractMediaFromContent();
      if (extracted) {
        console.log('✅ PostCardMedia: Found media in content');
        return;
      }
      
      // Fallback: Try to fetch from media_files table
      const {
        data,
        error
      } = await supabase.from('media_files').select('*').eq('post_id', post.id).order('display_order', {
        ascending: true
      }).limit(3);
      
      if (error) {
        console.error('❌ Error fetching media files:', error);
        console.log('⚠️ PostCardMedia: media_files query failed, content extraction already attempted');
        setLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('✅ PostCardMedia: Found', data.length, 'media files in media_files table');
        setMediaFiles(data as MediaFile[]);
      } else {
        console.log('⚠️ PostCardMedia: No media found in media_files table or content');
      }
    } catch (err) {
      console.error('❌ Exception fetching media files:', err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="w-full h-48 bg-gray-100 rounded-lg animate-pulse" />;
  }
  if (mediaFiles.length === 0) {
    return <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <FileImage className="h-8 w-8 text-gray-400" />
      </div>;
  }
  const firstMedia = mediaFiles[0];
  const remainingCount = mediaFiles.length - 1;
  return <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden bg-gray-100">
        {firstMedia.file_type.startsWith('image/') ? <img src={firstMedia.file_url} alt={firstMedia.caption || 'Media'} className="w-full h-48 object-cover" loading="lazy" onError={e => {
        e.currentTarget.style.display = 'none';
      }} /> : firstMedia.file_type.startsWith('video/') ? <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
            <Video className="h-12 w-12 text-white" />
          </div> : null}
        
        {remainingCount > 0 && <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            +{remainingCount} more
          </div>}
      </div>
      
      {firstMedia.caption && <p className="text-sm text-gray-600 line-clamp-2">{firstMedia.caption}</p>}
    </div>;
};