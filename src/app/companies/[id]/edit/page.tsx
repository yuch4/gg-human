"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CompanyForm from '@/components/companies/company-form'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface Company {
  id: string
  company_name: string
  created_at: string
  updated_at: string
}

export default function EditCompanyPage() {
  const params = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company:', error)
        toast({
          title: "エラー",
          description: "会社データの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [params.id, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!company) {
    return <div>会社が見つかりません</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Link href="/companies">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <h1 className="text-xl font-bold">会社情報編集</h1>
      </div>
      <CompanyForm initialData={company} />
    </div>
  )
}