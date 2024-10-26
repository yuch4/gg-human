'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface Company {
  id: string
  company_name: string
  created_at: string
  _count: {
    employees: number
    departments: number
  }
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          employees: employees(count),
          departments: departments(count)
        `)

      if (error) throw error
      
      const companiesWithCounts = data.map(company => ({
        ...company,
        _count: {
          employees: company.employees?.[0]?.count || 0,
          departments: company.departments?.[0]?.count || 0
        }
      }))
      
      setCompanies(companiesWithCounts)
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast({
        title: "エラー",
        description: "会社データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, employeeCount: number, departmentCount: number) => {
    if (employeeCount > 0 || departmentCount > 0) {
      toast({
        title: "削除できません",
        description: "この会社には従業員または部署が登録されているため削除できません",
        variant: "destructive",
      })
      return
    }

    if (!confirm('本当に削除しますか？')) return

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCompanies(companies.filter(company => company.id !== id))
      toast({
        title: "成功",
        description: "会社を削除しました",
      })
    } catch (error) {
      console.error('Error deleting company:', error)
      toast({
        title: "エラー",
        description: "会社の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>会社名</TableHead>
            <TableHead className="text-center">部署数</TableHead>
            <TableHead className="text-center">従業員数</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.company_name}</TableCell>
              <TableCell className="text-center">{company._count.departments}</TableCell>
              <TableCell className="text-center">{company._count.employees}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/companies/${company.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(
                      company.id, 
                      company._count.employees, 
                      company._count.departments
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}