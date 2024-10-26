'use client'

import EmployeeList from "@/components/employees/employee-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { CSVImport } from "@/components/employees/csv-import"

export default function EmployeesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">従業員一覧</h1>
        <div className="flex gap-2">
          <CSVImport />
          <Link href="/employees/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>
      <EmployeeList />
    </div>
  )
}