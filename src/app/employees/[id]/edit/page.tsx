"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import EmployeeForm from '@/components/employees/employee-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

type EmployeeDetail = {
  id: string
  first_name: string
  last_name: string
  email: string
  position: string
  company_id: string
  department_id: string
}

export default function EditEmployeePage() {
  const params = useParams()
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select(`
            id,
            first_name,
            last_name,
            email,
            position,
            company_id,
            department_id
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setEmployee(data)
      } catch (error) {
        console.error('Error fetching employee:', error)
        toast({
          title: "エラー",
          description: "従業員データの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [params.id, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!employee) {
    return <div>従業員が見つかりません</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Link href="/employees">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <h1 className="text-xl font-bold">従業員情報編集</h1>
      </div>
      <EmployeeForm 
        initialData={employee}
      />
    </div>
  )
}