import UploadDataForm from '@/app/org/[slug]/(with-margin)/upload-data/upload-data-form'
import { InterceptedSheetContent } from '@/components/intercepted-sheet-content'
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function UploadData() {
  return (
    <Sheet defaultOpen>
      <InterceptedSheetContent>
        <SheetHeader>
          <SheetTitle>Upload Data</SheetTitle>
        </SheetHeader>

        <div className="py-4">
          <UploadDataForm />
        </div>
      </InterceptedSheetContent>
    </Sheet>
  )
}
