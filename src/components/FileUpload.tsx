import { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function FileUpload({ onFileSelect, isLoading, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidExcelFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="mb-8">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center
          p-12 border-2 border-dashed rounded-2xl
          cursor-pointer transition-all duration-200
          ${isDragOver
            ? 'border-accent-primary bg-accent-glow'
            : 'border-border hover:border-accent-secondary hover:bg-bg-hover'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {/* Upload Icon */}
        <svg
          className="w-16 h-16 text-text-muted mb-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        <span className="text-text-primary font-semibold text-lg mb-2">
          {isLoading ? 'Przetwarzanie...' : 'Przeciagnij plik Excel lub kliknij'}
        </span>
        <span className="text-text-muted text-sm">
          Obslugiwane formaty: .xls, .xlsx
        </span>
      </label>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm max-h-32 overflow-y-auto">
          {error}
        </div>
      )}
    </div>
  );
}

function isValidExcelFile(file: File): boolean {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  return validTypes.includes(file.type) ||
         file.name.endsWith('.xls') ||
         file.name.endsWith('.xlsx');
}
