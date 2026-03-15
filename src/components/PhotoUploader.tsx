import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, ImagePlus, Loader2, GripVertical } from 'lucide-react';

interface PhotoUploaderProps {
  vehicleId: string;
  tenantId: string;
  existingPhotos: string[];
  maxPhotos?: number;
  onPhotosChange: (photos: string[]) => void;
}

export default function PhotoUploader({
  vehicleId,
  tenantId,
  existingPhotos,
  maxPhotos = 15,
  onPhotosChange,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(async (files: File[]) => {
    const remaining = maxPhotos - existingPhotos.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${maxPhotos} fotos atingido.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    if (toUpload.length < files.length) {
      toast.warning(`Apenas ${remaining} foto(s) podem ser adicionadas.`);
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é maior que 5MB.`);
        continue;
      }

      const ext = file.name.split('.').pop();
      const path = `${tenantId}/${vehicleId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from('autogest')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) {
        toast.error(`Erro ao enviar ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('autogest')
        .getPublicUrl(path);

      newUrls.push(urlData.publicUrl);
    }

    if (newUrls.length > 0) {
      const updated = [...existingPhotos, ...newUrls];
      onPhotosChange(updated);
      toast.success(`${newUrls.length} foto(s) enviada(s)!`);
    }
    setUploading(false);
  }, [existingPhotos, maxPhotos, tenantId, vehicleId, onPhotosChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, [uploadFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removePhoto = async (url: string) => {
    const path = url.split('/autogest/')[1];
    if (path) {
      await supabase.storage.from('autogest').remove([path]);
    }
    onPhotosChange(existingPhotos.filter(p => p !== url));
    toast.success('Foto removida.');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Fotos ({existingPhotos.length}/{maxPhotos})
        </p>
      </div>

      {/* Photo Grid */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {existingPhotos.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removePhoto(url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                  Capa
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {existingPhotos.length < maxPhotos && (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`photo-input-${vehicleId}`)?.click()}
        >
          <input
            id={`photo-input-${vehicleId}`}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Enviando fotos...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arraste fotos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WEBP • Máx. 5MB cada • Até {maxPhotos - existingPhotos.length} restante(s)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
