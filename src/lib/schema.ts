// src/lib/schema.ts
import * as z from "zod"

export const employeeSchema = z.object({
  first_name: z.string().min(1, { message: "名は必須です" }),
  last_name: z.string().min(1, { message: "姓は必須です" }),
  email: z.string().email({ message: "正しいメールアドレスを入力してください" }),
  position: z.string().min(1, { message: "役職は必須です" }),
  company_id: z.string().uuid({ message: "会社を選択してください" }),
  //department_id: z.string().nullable().optional(),
  department_id: z.union([z.string(), z.literal('none')])
})

export type EmployeeFormData = z.infer<typeof employeeSchema>