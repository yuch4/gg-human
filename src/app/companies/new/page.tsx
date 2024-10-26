'use client'

import CompanyForm from "@/components/companies/company-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewCompanyPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Link href="/companies">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <h1 className="text-xl font-bold">会社登録</h1>
      </div>
      <CompanyForm />
    </div>
  )
}