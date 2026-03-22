'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'

interface UnsavedChangesContextType {
  showDialog: (onConfirm: () => void) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined)

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [onConfirmAction, setOnConfirmAction] = useState<(() => void) | null>(null)

  const showDialog = useCallback((onConfirm: () => void) => {
    setOnConfirmAction(() => onConfirm)
    setIsOpen(true)
  }, [])

  const handleConfirm = () => {
    if (onConfirmAction) onConfirmAction()
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setOnConfirmAction(null)
  }

  return (
    <UnsavedChangesContext.Provider value={{ showDialog }}>
      {children}
      <UnsavedChangesDialog isOpen={isOpen} onConfirm={handleConfirm} onCancel={handleCancel} />
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedDialog() {
  const context = useContext(UnsavedChangesContext)
  if (!context) {
    throw new Error('useUnsavedDialog must be used within an UnsavedChangesProvider')
  }
  return context
}
