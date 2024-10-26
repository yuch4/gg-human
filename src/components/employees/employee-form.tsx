"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { employeeSchema, type EmployeeFormData } from "@/lib/schema"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Employee } from "@/lib/supabase/client"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Company {
  id: string
  company_name: string
}

interface Department {
  id: string
  department_name: string
}

interface Props {
  initialData?: Employee
}

export default function EmployeeForm({ initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  //const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialData?.company_id || "")
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData ? {
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      email: initialData.email,
      position: initialData.position,
      company_id: initialData.company_id,  // これが確実に設定されているか確認
      department_id: initialData.department_id || 'none'
    } : {
      first_name: "",
      last_name: "",
      email: "",
      position: "",
      company_id: "",
      department_id: 'none',
    }
  })

  useEffect(() => {
    async function fetchCompanies() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, company_name')

        if (error) throw error
        setCompanies(data || [])
      } catch (error) {
        console.error('Error fetching companies:', error)
        toast({
          title: "エラー",
          description: "会社情報の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [toast])

  useEffect(() => {
    async function fetchDepartments() {
      if (!selectedCompanyId) {
        setDepartments([])
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, department_name')
          .eq('company_id', selectedCompanyId)

        if (error) throw error
        setDepartments(data || [])
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast({
          title: "エラー",
          description: "部署情報の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [selectedCompanyId, toast])

// 初期データがあ���場合の会社IDと部署の設定
useEffect(() => {
  if (initialData) {
    setSelectedCompanyId(initialData.company_id)
    setValue('company_id', initialData.company_id)
    setValue('department_id', initialData.department_id || 'none')
  }
}, [initialData, setValue])

// エラーハンドリングの型定義
interface SupabaseError {
  code: string;
  message: string;
  details?: string;
}

// Supabaseのupdateとinsert操作の型定義
type EmployeeUpdateData = {
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  company_id: string;
  department_id: string; // nullを削除
};

// 会社が変更された時に、その会社の部署一覧を取得
const handleCompanyChange = (value: string) => {
  setSelectedCompanyId(value)
  setValue('company_id', value)
  setValue('department_id', 'none')
  setApiError(null)

  // 会社が変更された時に、その会社の部署一覧を取得
  if (value) {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, department_name')
          .eq('company_id', value)

        if (error) throw error
        setDepartments(data || [])
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast({
          title: "エラー",
          description: "部署情報の取得に失敗しました",
          variant: "destructive",
        })
      }
    }
    fetchDepartments()
  } else {
    setDepartments([])
  }
}

  const onSubmit = async (data: EmployeeFormData) => {
    setApiError(null)
    setIsLoading(true)
    
    try {
      const employeeData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        position: data.position,
        company_id: data.company_id,
        department_id: data.department_id === "none" ? null : data.department_id
      }

      console.log('Saving employee data:', employeeData) // デバッグ用

      if (initialData) {
        const { error: updateError } = await supabase
          .from('employees')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            position: data.position,
            company_id: data.company_id,
            department_id: data.department_id === 'none' ? null : data.department_id
          } satisfies EmployeeUpdateData)
          .eq('id', initialData.id)

        if (updateError) {
          console.error('Update error:', updateError) // デバッグ用
          throw updateError
        }

        toast({
          title: "更新完了",
          description: (
            <div className="flex flex-col space-y-2">
              <p>従業員情報を更新しました。</p>
              <div className="text-sm text-muted-foreground">
                <p>名前: {data.last_name} {data.first_name}</p>
                <p>メール: {data.email}</p>
              </div>
            </div>
          ),
          duration: 5000,
        })

        setSuccessMessage("従業員情報を更新しました")
      } else {
        const { error: insertError } = await supabase
          .from('employees')
          .insert([{
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            position: data.position,
            company_id: data.company_id,
            department_id: data.department_id === 'none' ? '' : data.department_id // nullの代わりに空文字を使用
          } satisfies EmployeeUpdateData])

        if (insertError) {
          console.error('Insert error:', insertError) // デバッグ用
          throw insertError
        }

        toast({
          title: "登録完了",
          description: (
            <div className="flex flex-col space-y-2">
              <p>従業員を登録しました。</p>
              <div className="text-sm text-muted-foreground">
                <p>名前: {data.last_name} {data.first_name}</p>
                <p>メール: {data.email}</p>
              </div>
            </div>
          ),
          duration: 5000,
        })

        setSuccessMessage("従業員を登録しました")
      }

      setTimeout(() => {
        router.push('/employees')
        router.refresh()
      }, 3000)
    } catch (error: unknown) {
      console.error('Error saving employee:', error)
      let errorMessage = '保存に失敗しました'
      
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as SupabaseError
        if (supabaseError.code === '23505') {
          errorMessage = 'このメールアドレスは既に登録されています'
        }
      }
      
      setApiError(errorMessage)
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? '従業員情報編集' : '新規従業員登録'}</CardTitle>
      </CardHeader>
      <CardContent>
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 ml-2">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className={`space-y-4 ${
            successMessage ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="space-y-2">
            <Label>会社 <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={handleCompanyChange}
              value={selectedCompanyId}
              disabled={isLoading || !!successMessage}
            >
              <SelectTrigger className={errors.company_id ? "border-red-500" : ""}>
                <SelectValue placeholder="会社を選択">
                  {companies.find(c => c.id === selectedCompanyId)?.company_name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem 
                    key={company.id} 
                    value={company.id}
                  >
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.company_id && (
              <p className="text-sm text-red-500">{errors.company_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>部署</Label>
            <Select
              onValueChange={(value) => {
                console.log('Selected department value:', value) // デバッグ用
                setValue('department_id', value)
              }}
              //defaultValue="none"
              value={watch('department_id') || 'none'}
              disabled={!selectedCompanyId || isLoading || !!successMessage}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCompanyId ? "部署を選択" : "先に会社を選択してください"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">部署なし</SelectItem>
                {departments.map((department) => (
                  <SelectItem  
                    key={department.id} 
                    value={department.id}
                  >
                    {department.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_name">姓 <span className="text-red-500">*</span></Label>
              <Input
                id="last_name"
                {...register("last_name")}
                className={errors.last_name ? "border-red-500" : ""}
                disabled={isLoading || !!successMessage}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">名 <span className="text-red-500">*</span></Label>
              <Input
                id="first_name"
                {...register("first_name")}
                className={errors.first_name ? "border-red-500" : ""}
                disabled={isLoading || !!successMessage}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">役職 <span className="text-red-500">*</span></Label>
            <Input
              id="position"
              {...register("position")}
              className={errors.position ? "border-red-500" : ""}
              disabled={isLoading || !!successMessage}
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading || !!successMessage}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading || !!successMessage}
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !!successMessage}
              className={`min-w-[100px] ${
                successMessage ? 'bg-green-500 hover:bg-green-600' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </div>
              ) : successMessage ? (
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  完了
                </div>
              ) : (
                '保存'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
