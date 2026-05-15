"use client";

import { useState } from "react";
import { ClipboardIcon, CodeIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ExportDialogProps = Readonly<{
  css: string;
}>;

export function ExportDialog({ css }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function handleCopyClick(): Promise<void> {
    if (!navigator.clipboard) {
      setCopyError("Clipboard API is unavailable in this browser context.");
      return;
    }

    try {
      await navigator.clipboard.writeText(css);
      setCopyError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCopyError(`Clipboard write failed: ${message}`);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CodeIcon data-icon="inline-start" />
        Code
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export CSS</DialogTitle>
            <DialogDescription>Copy these CSS variables into your Tailwind v4 theme file.</DialogDescription>
          </DialogHeader>
          <Textarea className="min-h-[440px] font-mono text-xs" value={css} readOnly />
          {copyError ? <p className="text-sm text-destructive">{copyError}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopyClick}>
              <ClipboardIcon data-icon="inline-start" />
              Copy CSS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
