'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as z from "zod"

interface Props {
  initialData?: {
    id: string
    company_name: string
  }
}

const companySchema = z.object({
  company_name: z.string().min(1, { message: "会社名は必須です" }),
})

type CompanyFormData = z.infer<typeof companySchema>

export default function CompanyForm({ initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData ? {
      company_name: initialData.company_name,
    } : {
      company_name: "",
    }
  })

  const onSubmit = async (data: CompanyFormData) => {
    setApiError(null)
    setIsLoading(true)
    
    try {
      if (initialData) {
        const { error } = await supabase
          .from('companies')
          .update({
            company_name: data.company_name,
          })
          .eq('id', initialData.id)

        if (error) throw error

        toast({
          title: "更新完了",
          description: "会社情報を更新しました",
        })
        
        setSuccessMessage("会社情報を更新しました")
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([{
            company_name: data.company_name,
          }])

        if (error) throw error

        toast({
          title: "登録完了",
          description: "会社を登録しました",
        })
        
        setSuccessMessage("会社を登録しました")
      }

      setTimeout(() => {
        router.push('/companies')
        router.refresh()
      }, 3000)
    } catch (error: any) {
      console.error('Error:', error)
      setApiError("会社の保存に失敗しました")
      toast({
        title: "エラー",
        description: "会社の保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? '会社情報編集' : '新規会社登録'}</CardTitle>
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
            <Label htmlFor="company_name">会社名 <span className="text-red-500">*</span></Label>
            <Input
              id="company_name"
              {...register("company_name")}
              className={errors.company_name ? "border-red-500" : ""}
              disabled={isLoading || !!successMessage}
            />
            {errors.company_name && (
              <p className="text-sm text-red-500">{errors.company_name.message}</p>
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