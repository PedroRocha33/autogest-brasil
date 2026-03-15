import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';

interface PhotoGalleryProps {
  photos: string[];
  alt?: string;
}

export default function PhotoGallery({ photos, alt = 'Veículo' }: PhotoGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-secondary rounded-xl flex items-center justify-center">
        <Car className="h-16 w-16 text-muted-foreground/30" />
      </div>
    );
  }

  const prev = () => setCurrent(c => (c === 0 ? photos.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === photos.length - 1 ? 0 : c + 1));

  return (
    <>
      {/* Main image */}
      <div className="relative group">
        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-secondary">
          <img
            src={photos[current]}
            alt={`${alt} - foto ${current + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setFullscreen(true)}
          />
        </div>

        {photos.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setFullscreen(true)}
        >
          <Expand className="h-4 w-4" />
        </Button>

        {photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-foreground">
            {current + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={url}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setFullscreen(false)}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          <img
            src={photos[current]}
            alt={`${alt} - foto ${current + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
            {current + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
