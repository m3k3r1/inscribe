-- CreateTable
CREATE TABLE "dataset_usages" (
    "id" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataset_id" TEXT NOT NULL,

    CONSTRAINT "dataset_usages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dataset_usages" ADD CONSTRAINT "dataset_usages_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
