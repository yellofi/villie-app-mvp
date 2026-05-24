module.exports = function (api) {
  // NODE_ENV가 바뀔 때 캐시 무효화 (test vs production 구분)
  api.cache.using(() => process.env.NODE_ENV)

  const isTest = process.env.NODE_ENV === 'test'

  return {
    presets: ['babel-preset-expo'],
    // nativewind/babel은 테스트 환경에서 충돌하므로 비활성화
    plugins: isTest ? [] : ['nativewind/babel'],
  }
}
