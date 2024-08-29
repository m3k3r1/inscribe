import UploadDataForm from './upload-data-form'

export default async function UploadData() {
  return (
    <div className="space-y-4 py-4">
      <main className="mx-auto w-full max-w-[1200px] space-y-4">
        <h1 className="text-2xl font-bold">Upload Data</h1>

        <UploadDataForm />
      </main>
    </div>
  )
}
