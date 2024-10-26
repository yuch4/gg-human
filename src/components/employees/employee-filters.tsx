"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface FilterProps {
  filters: {
    search: string
    company: string
    department: string
  }
  onFilterChange: (name: string, value: string) => void
  onReset: () => void
  companies: string[]
  departments: string[]
}

export function EmployeeFilters({
  filters,
  onFilterChange,
  onReset,
  companies,
  departments
}: FilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="名前、メールアドレスで検索"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select
          value={filters.company}
          onValueChange={(value) => onFilterChange('company', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="会社で絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-companies" value="all">すべての会社</SelectItem>
            {companies.map((company) => (
              <SelectItem 
                key={`company-${company}`} 
                value={company}
              >
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.department}
          onValueChange={(value) => onFilterChange('department', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="部署で絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all-departments" value="all">すべての部署</SelectItem>
            {departments.map((department) => (
              <SelectItem 
                key={`department-${department}`} 
                value={department}
              >
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onReset}>
          <X className="h-4 w-4 mr-2" />
          リセット
        </Button>
      </div>
    </div>
  )
}