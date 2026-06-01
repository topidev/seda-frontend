import ProtectedPage from '@/components/ProtectedPage'
import ComingSoon from '@/components/ComingSoon'

export default function GroupsPage() {
  return (
    <ProtectedPage>
      <ComingSoon title="Grupos" />
    </ProtectedPage>
  )
}