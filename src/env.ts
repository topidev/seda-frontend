const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const

// Valida en tiempo de build que las variables existen
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Variable de entorno faltante: ${key}`)
  }
})

export const env = requiredEnvVars as {
  NEXT_PUBLIC_API_URL: string
}