import ProtectedPage from '@/components/ProtectedPage'
import ComingSoon from '@/components/ComingSoon'

export default function StudentsPage() {
  return (
    <ProtectedPage>
      <ComingSoon title="Estudiantes" />
    </ProtectedPage>
  )
}