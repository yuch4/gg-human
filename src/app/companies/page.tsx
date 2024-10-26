'use client'

import { Button } from "@/components/ui/button"
import CompanyList from "@/components/companies/company-list"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function CompaniesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">会社一覧</h1>
        <Link href="/companies/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </Link>
      </div>
      <CompanyList />
    </div>
  )
}