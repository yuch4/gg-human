"use client"

import EmployeeForm from "@/components/employees/employee-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewEmployeePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Link href="/employees">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <h1 className="text-xl font-bold">従業員登録</h1>
      </div>
      <EmployeeForm />
    </div>
  )
}