import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from 'react-filerobot-image-editor';
import { X } from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (editedImageBlob: Blob) => void;
}

export default function ImageEditorModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
}: ImageEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <X className="h-6 w-6" />
        </button>

        <FilerobotImageEditor
          source={imageUrl}
          onSave={(editedImageObject: any) => {
            // Filerobot returns the image as base64 or blob inside imageObject
            if (editedImageObject.imageBase64) {
                fetch(editedImageObject.imageBase64)
                .then(res => res.blob())
                .then(blob => {
                    onSave(blob);
                });
            }
          }}
          onClose={onClose}
          annotationsCommon={{
            fill: '#ff0000',
          }}
          Text={{ text: 'Gravity...' }}
          Rotate={{ angle: 90, componentType: 'slider' }}
          tabsIds={[TABS.ADJUST, TABS.FINETUNE, TABS.FILTERS, TABS.RESIZE]}
          defaultTabId={TABS.ADJUST}
          defaultToolId={TOOLS.CROP}
          savingPixelRatio={1}
          previewPixelRatio={1}
        />
      </div>
    </div>
  );
}
