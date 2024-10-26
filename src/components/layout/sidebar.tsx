import Link from "next/link"
import { Users, Building2 } from "lucide-react"

const Sidebar = () => {
  return (
    <div className="w-64 border-r h-[calc(100vh-64px)]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <nav className="space-y-1">
            <Link 
              href="/employees"
              className="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
            >
              <Users className="h-5 w-5 mr-3" />
              従業員一覧
            </Link>
            <Link 
              href="/companies"
              className="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
            >
              <Building2 className="h-5 w-5 mr-3" />
              会社一覧
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar