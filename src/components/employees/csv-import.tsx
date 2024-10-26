"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Papa from 'papaparse'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

interface CSVRow {
  会社名: string
  姓: string
  名: string
  メールアドレス: string
  部署: string
  役職: string
}

interface ValidationResult {
  isValid: boolean
  errors: Array<{
    row: number
    error: string
  }>
}

interface ImportResult {
  success: boolean
  totalRows: number
  errors: Array<{
    row: number
    error: string
  }>
}

export function CSVImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const resetState = () => {
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateRow = (row: CSVRow, rowIndex: number) => {
    const errors: string[] = []

    if (!row.会社名) errors.push('会社名は必須です')
    if (!row.姓) errors.push('姓は必須です')
    if (!row.名) errors.push('名は必須です')
    if (!row.メールアドレス) {
      errors.push('メールアドレスは必須です')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.メールアドレス)) {
      errors.push('メールアドレスの形式が不正です')
    }
    //if (!row.部署) errors.push('部署は必須です')
    if (!row.役職) errors.push('役職は必須です')

    return errors
  }

  // 全データの事前バリデーション
  const validateAllRows = (rows: CSVRow[]): ValidationResult => {
    const result: ValidationResult = {
      isValid: true,
      errors: []
    }

    rows.forEach((row, index) => {
      const rowNumber = index + 2 // ヘッダー行を考慮して+2
      const errors = validateRow(row, rowNumber)
      
      if (errors.length > 0) {
        result.isValid = false
        result.errors.push({
          row: rowNumber,
          error: errors.join(', ')
        })
      }
    })

    return result
  }

  const processCSV = async (file: File) => {
    setIsLoading(true)
    setResult(null)

    try {
      const text = await file.text()
      Papa.parse(text, {
        header: true,
        encoding: "utf-8",
        complete: async (results) => {
          const rows = results.data as CSVRow[]
          
          // 事前バリデーション
          const validation = validateAllRows(rows)
          
          if (!validation.isValid) {
            setResult({
              success: false,
              totalRows: rows.length,
              errors: validation.errors
            })
            setIsLoading(false)
            return
          }

          try {
            // トランザクション的な処理のために、すべてのデータを準備
            const importData = await Promise.all(rows.map(async (row) => {
              // 1. 会社の取得または作成
              let { data: company, error: companyError } = await supabase
                .from('companies')
                .select('id')
                .eq('company_name', row.会社名)
                .single()

              if (companyError) {
                const { data: newCompany, error: createCompanyError } = await supabase
                  .from('companies')
                  .insert({ company_name: row.会社名 })
                  .select('id')
                  .single()

                if (createCompanyError) throw new Error('会社の作成に失敗しました')
                company = newCompany
              }

              // 2. 部署の取得または作成
              let departmentId = null
              if (row.部署) {
                let { data: department, error: departmentError } = await supabase
                  .from('departments')
                  .select('id')
                  .eq('company_id', company.id)
                  .eq('department_name', row.部署)
                  .single()

                if (departmentError) {
                  const { data: newDepartment, error: createDepartmentError } = await supabase
                    .from('departments')
                    .insert({
                      company_id: company.id,
                      department_name: row.部署
                    })
                    .select('id')
                    .single()

                if (createDepartmentError) throw new Error('部署の作成に失敗しました')
                department = newDepartment
              }
              departmentId = department.id
            }

            return {
              company_id: company.id,
              department_id: departmentId,  // null の可能性あり
              first_name: row.名,
              last_name: row.姓,
              email: row.メールアドレス,
              position: row.役職
            }
            }))

            // すべての従業員データを一括で登録
            const { error: employeesError } = await supabase
              .from('employees')
              .insert(importData)

            if (employeesError) {
              throw new Error(
                employeesError.code === '23505' 
                  ? 'メールアドレスが重複しているデータが含まれています'
                  : 'データの登録に失敗しました'
              )
            }

            setResult({
              success: true,
              totalRows: rows.length,
              errors: []
            })

            toast({
              title: "インポート完了",
              description: `${rows.length}件のデータをインポートしました`,
              variant: "default",
            })

          } catch (error: any) {
            console.error('Import Error:', error)
            setResult({
              success: false,
              totalRows: rows.length,
              errors: [{
                row: 0,
                error: error.message || 'インポートに失敗しました'
              }]
            })

            toast({
              title: "インポート失敗",
              description: error.message || "データのインポートに失敗しました",
              variant: "destructive",
            })
          }

          setIsLoading(false)
        },
        error: (error) => {
          console.error('CSV Parse Error:', error)
          toast({
            title: "エラー",
            description: "CSVファイルの解析に失敗しました",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      })
    } catch (error) {
      console.error('File Read Error:', error)
      toast({
        title: "エラー",
        description: "ファイルの読み込みに失敗しました",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "エラー",
        description: "CSVファイルを選択してください",
        variant: "destructive",
      })
      return
    }

    processCSV(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          CSVインポート
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CSVファイルインポート</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            <p>以下の列を含むCSVファイルをアップロードしてください：</p>
            <ul className="list-disc list-inside mt-2">
              <li>会社名</li>
              <li>姓</li>
              <li>名</li>
              <li>メールアドレス</li>
              <li>部署</li>
              <li>役職</li>
            </ul>
          </div>

          {!isLoading && !result && (
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">インポート中...</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <Alert 
                className={result.success ? "bg-green-50" : "bg-red-50"}
              >
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className="ml-2">
                    {result.success
                      ? `${result.totalRows}件のデータをインポートしました`
                      : "インポートに失敗しました"}
                  </AlertDescription>
                </div>
              </Alert>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">エラー詳細：</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 mb-1">
                        {error.row === 0 
                          ? error.error 
                          : `行 ${error.row}: ${error.error}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => {
                  resetState()
                  setIsOpen(false)
                }}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}