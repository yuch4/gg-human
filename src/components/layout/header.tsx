import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"

const Header = () => {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">人事情報管理システム</h2>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header