import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const MAX_SCALE = 1.6;
const MIN_SCALE = 1;
const Thumbnail = ({ url }: { url?: string | null }) => {
  const [scale, setScale] = useState(MIN_SCALE);

  if (!url) return null;
  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative overflow-hidden max-w-[360px] border rounded-lg my-2 cursor-zoom-in">
          <img src={url} alt="Message Image" className="rounded-md object-cover size-full" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <div className="relative">
          <img
            src={url}
            style={{ scale }}
            alt="Message Image"
            className="rounded-md object-cover size-full"
          />
          <div className="absolute left-0 right-0 mx-auto w-fit px-2 py-1 bg-white/10 rounded-md space-x-2">
            <Hint label="Zoom In">
              <Button
                disabled={scale >= MAX_SCALE}
                onClick={() => {
                  if (scale >= MAX_SCALE) return;
                  setScale((p) => p + 0.1);
                }}
                className="rounded-full size-6 p-0"
                variant="transparent"
              >
                <Plus className="size-4" />
              </Button>
            </Hint>
            <Hint label="Zoom Out">
              <Button
                disabled={scale <= MIN_SCALE}
                onClick={() => {
                  if (scale <= MIN_SCALE) return;
                  setScale((p) => p - 0.1);
                }}
                className="rounded-full size-6 p-0"
                variant="transparent"
              >
                <Minus className="size-4" />
              </Button>
            </Hint>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Thumbnail;
