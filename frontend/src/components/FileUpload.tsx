import { useState, useCallback } from 'react'
import { Upload, File, X } from 'lucide-react'

interface FileUploadProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number // in MB
}

export default function FileUpload({ onUpload, accept = '.pdf,.csv,.xlsx,.docx,.txt', maxSize = 10 }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): boolean => {
    setError('')

    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSize}MB`)
      return false
    }

    const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase())
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExt)) {
      setError(`Tipo de arquivo não permitido. Aceitos: ${accept}`)
      return false
    }

    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onUpload(file)
      }
    }
  }, [onUpload])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onUpload(file)
      }
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError('')
  }

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Arraste e solte ou <span className="text-blue-600 font-medium">clique para selecionar</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, CSV, XLSX, DOCX, TXT (máx. {maxSize}MB)
          </p>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {selectedFile && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
          <File className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
          <span className="text-xs text-gray-400">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
          <button onClick={clearFile} className="p-1 hover:bg-gray-200 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  )
}
