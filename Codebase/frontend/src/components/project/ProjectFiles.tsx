import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCode,
  MoreHorizontal,
  Download,
  Trash2,
  Search,
  Grid3X3,
  List,
  Upload,
  Folder
} from 'lucide-react';
import type { FileItem } from '@/types/admin';

const files: FileItem[] = [
  {
    id: '1',
    name: 'Design_Mockups_v2.fig',
    type: 'Figma',
    size: '24.5 MB',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2024-03-04T10:30:00Z',
  },
  {
    id: '2',
    name: 'Project_Requirements.pdf',
    type: 'PDF',
    size: '3.2 MB',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-03-03T14:20:00Z',
  },
  {
    id: '3',
    name: 'Homepage_Analytics.xlsx',
    type: 'Spreadsheet',
    size: '1.8 MB',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2024-03-02T09:15:00Z',
  },
  {
    id: '4',
    name: 'API_Documentation.md',
    type: 'Document',
    size: '45 KB',
    uploadedBy: 'Sarah Wilson',
    uploadedAt: '2024-03-01T16:45:00Z',
  },
  {
    id: '5',
    name: 'Hero_Banner_Final.png',
    type: 'Image',
    size: '2.4 MB',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2024-02-28T11:30:00Z',
  },
  {
    id: '6',
    name: 'Component_Library.tsx',
    type: 'Code',
    size: '128 KB',
    uploadedBy: 'Tom Brown',
    uploadedAt: '2024-02-27T13:20:00Z',
  },
];

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <ImageIcon size={20} className="text-purple-500" />;
    case 'spreadsheet':
    case 'excel':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet size={20} className="text-emerald-500" />;
    case 'code':
    case 'tsx':
    case 'ts':
    case 'js':
      return <FileCode size={20} className="text-blue-500" />;
    case 'figma':
      return <Folder size={20} className="text-pink-500" />;
    default:
      return <FileText size={20} className="text-admin-text-muted" />;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ProjectFiles: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-admin-surface border border-admin-border rounded-lg text-sm text-admin-text-primary placeholder:text-admin-text-muted focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-admin-primary text-white text-sm font-medium rounded-lg hover:bg-admin-primary/90 transition-colors"
          >
            <Upload size={16} />
            Upload File
          </button>

          <div className="flex bg-admin-surface border border-admin-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-admin-text-muted'
              )}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-admin-text-muted'
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Files List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-admin-surface rounded-xl border border-admin-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-admin-bg">
              <tr>
                <th className="text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider px-4 py-3">Size</th>
                <th className="text-left text-xs font-medium text-admin-text-muted uppercase tracking-wider px-4 py-3">Uploaded</th>
                <th className="text-right text-xs font-medium text-admin-text-muted uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-admin-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span className="text-sm font-medium text-admin-text-primary">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-admin-text-secondary">{file.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-admin-text-secondary">{file.size}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-admin-text-secondary">
                      <span>{formatDate(file.uploadedAt)}</span>
                      <p className="text-xs text-admin-text-muted">by {file.uploadedBy}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-admin-bg rounded text-admin-text-muted hover:text-admin-primary transition-colors">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-admin-bg rounded text-admin-text-muted hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-admin-bg rounded text-admin-text-muted">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-admin-surface rounded-xl p-4 border border-admin-border hover:border-admin-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-admin-bg rounded-lg flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-admin-bg rounded text-admin-text-muted transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <p className="text-sm font-medium text-admin-text-primary truncate">{file.name}</p>
              <p className="text-xs text-admin-text-muted mt-0.5">{file.size} • {file.type}</p>
            </div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="text-admin-text-muted" size={24} />
          </div>
          <h3 className="text-lg font-medium text-admin-text-primary mb-1">No files found</h3>
          <p className="text-sm text-admin-text-muted">Upload files or try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectFiles;
