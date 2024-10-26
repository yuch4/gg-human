"use client"

import { useEffect, useState, useMemo } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { EmployeeFilters } from './employee-filters'
import { Pagination } from '@/components/ui/pagination'
import Link from 'next/link'

interface Employee {
  id: string
  company_id: string
  company: {
    company_name: string
  }
  department_id: string
  department: {
    department_name: string
  }
  first_name: string
  last_name: string
  email: string
  position: string
  created_at: string
  updated_at: string
}

const ITEMS_PER_PAGE = 10

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    company: 'all',
    department: 'all'
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  
  const { toast } = useToast()

  const companies = useMemo(() => 
    [...new Set(employees.map(emp => emp.company.company_name))],
    [employees]
  )
  const departments = useMemo(() => 
    [...new Set(employees.map(emp => emp.department.department_name))],
    [employees]
  )

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          company:companies(company_name),
          department:departments(department_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast({
        title: "エラー",
        description: "従業員データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        `${emp.last_name} ${emp.first_name}`.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      const matchesCompany = filters.company === 'all' || emp.company.company_name === filters.company
      const matchesDepartment = filters.department === 'all' || emp.department.department_name === filters.department
      
      return matchesSearch && matchesCompany && matchesDepartment
    })
  }, [employees, filters])

  const sortedEmployees = useMemo(() => {
    if (!sortConfig.key) return filteredEmployees

    return [...filteredEmployees].sort((a, b) => {
      let aValue = a[sortConfig.key!]
      let bValue = b[sortConfig.key!]

      // 特殊なケースの処理（会社名と部署名）
      if (sortConfig.key === 'company') {
        aValue = a.company.company_name
        bValue = b.company.company_name
      } else if (sortConfig.key === 'department') {
        aValue = a.department.department_name
        bValue = b.department.department_name
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredEmployees, sortConfig])

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedEmployees.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedEmployees, currentPage])

  const totalPages = Math.ceil(sortedEmployees.length / ITEMS_PER_PAGE)

  const handleSort = (key: keyof Employee) => {
    setSortConfig(current => ({
      key,
      direction: 
        current.key === key && current.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }))
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      company: 'all',
      department: 'all'
    })
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmployees(employees.filter(emp => emp.id !== id))
      toast({
        title: "成功",
        description: "従業員を削除しました",
      })
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast({
        title: "エラー",
        description: "従業員の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const exportToCsv = () => {
    const headers = [
      '会社名',
      '部署',
      '氏名',
      '役職',
      'メールアドレス'
    ].join(',')

    const rows = sortedEmployees.map(emp => [
      emp.company.company_name,
      emp.department.department_name,
      `${emp.last_name} ${emp.first_name}`,
      emp.position,
      emp.email
    ].map(field => `"${field}"`).join(','))

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '従業員一覧.csv'
    link.click()
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <EmployeeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          companies={companies}
          departments={departments}
        />
        <Button onClick={exportToCsv}>
          <Download className="h-4 w-4 mr-2" />
          CSVエクスポート
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('company')}
              >
                会社名
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('department')}
              >
                部署
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('last_name')}
              >
                氏名
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('position')}
              >
                役職
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('email')}
              >
                メールアドレス
              </TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.company.company_name}</TableCell>
                <TableCell>{employee.department?.department_name || '-'}</TableCell>
                <TableCell>{`${employee.last_name} ${employee.first_name}`}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/employees/${employee.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}