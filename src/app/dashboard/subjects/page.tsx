import ProtectedPage from '@/components/ProtectedPage'
import ComingSoon from '@/components/ComingSoon'

export default function SubjectsPage() {
  return (
    <ProtectedPage>
      <ComingSoon title="Materias" />
    </ProtectedPage>
  )
}