import { useAuthStore } from './auth.store'

beforeEach(() => {
  useAuthStore.getState().reset()
})

describe('auth.store', () => {
  describe('초기 상태', () => {
    it('phone은 빈 문자열이다', () => {
      expect(useAuthStore.getState().phone).toBe('')
    })

    it('nickname은 빈 문자열이다', () => {
      expect(useAuthStore.getState().nickname).toBe('')
    })

    it('isAuthenticated는 false이다', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('userId는 null이다', () => {
      expect(useAuthStore.getState().userId).toBeNull()
    })

    it('userType은 null이다', () => {
      expect(useAuthStore.getState().userType).toBeNull()
    })

    it('isLoading은 false이다', () => {
      expect(useAuthStore.getState().isLoading).toBe(false)
    })

    it('error는 null이다', () => {
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('setPhone', () => {
    it('phone 상태를 업데이트한다', () => {
      useAuthStore.getState().setPhone('010-1234-5678')
      expect(useAuthStore.getState().phone).toBe('010-1234-5678')
    })

    it('다른 상태는 변경하지 않는다', () => {
      useAuthStore.getState().setPhone('010-9999-0000')
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().userId).toBeNull()
    })
  })

  describe('setNickname', () => {
    it('nickname 상태를 업데이트한다', () => {
      useAuthStore.getState().setNickname('홍길동')
      expect(useAuthStore.getState().nickname).toBe('홍길동')
    })

    it('다른 상태는 변경하지 않는다', () => {
      useAuthStore.getState().setNickname('빌리')
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().phone).toBe('')
    })
  })

  describe('setUserType', () => {
    it('userType을 PARENT로 설정한다', () => {
      useAuthStore.getState().setUserType('PARENT')
      expect(useAuthStore.getState().userType).toBe('PARENT')
    })

    it('userType을 SENIOR로 설정한다', () => {
      useAuthStore.getState().setUserType('SENIOR')
      expect(useAuthStore.getState().userType).toBe('SENIOR')
    })

    it('다른 상태는 변경하지 않는다', () => {
      useAuthStore.getState().setUserType('PARENT')
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().phone).toBe('')
    })
  })

  describe('setAuthenticated', () => {
    it('isAuthenticated를 true로 설정한다', () => {
      useAuthStore.getState().setAuthenticated('user-123')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('userId를 전달된 값으로 설정한다', () => {
      useAuthStore.getState().setAuthenticated('user-abc')
      expect(useAuthStore.getState().userId).toBe('user-abc')
    })

    it('userType을 함께 전달하면 업데이트한다', () => {
      useAuthStore.getState().setAuthenticated('user-abc', 'SENIOR')
      expect(useAuthStore.getState().userType).toBe('SENIOR')
    })

    it('userType 미전달 시 기존 userType을 유지한다', () => {
      useAuthStore.getState().setUserType('PARENT')
      useAuthStore.getState().setAuthenticated('user-xyz')
      expect(useAuthStore.getState().userType).toBe('PARENT')
    })

    it('phone, userType 등 다른 상태는 변경하지 않는다', () => {
      useAuthStore.getState().setPhone('010-1111-2222')
      useAuthStore.getState().setUserType('SENIOR')
      useAuthStore.getState().setAuthenticated('user-xyz')
      expect(useAuthStore.getState().phone).toBe('010-1111-2222')
      expect(useAuthStore.getState().userType).toBe('SENIOR')
    })
  })

  describe('reset', () => {
    it('모든 상태를 초기값으로 되돌린다', () => {
      useAuthStore.getState().setPhone('010-1234-5678')
      useAuthStore.getState().setNickname('홍길동')
      useAuthStore.getState().setUserType('PARENT')
      useAuthStore.getState().setAuthenticated('user-123', 'PARENT')

      useAuthStore.getState().reset()

      const state = useAuthStore.getState()
      expect(state.phone).toBe('')
      expect(state.nickname).toBe('')
      expect(state.isAuthenticated).toBe(false)
      expect(state.userId).toBeNull()
      expect(state.userType).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })
})
