Pod::Spec.new do |s|
  s.name           = 'Connector'
  s.version        = '1.0.0'
  s.summary        = 'Connector module for database connections'
  s.description    = 'Connector module for database connections with SSH tunnel support'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.license        = { :type => 'MIT' }
  s.platforms      = {
    :ios => '17.0',
  }
  s.source         = { git: '', :tag => s.version.to_s }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'PostgresClientKit'

  spm_dependency(s,
    url: 'https://github.com/simon-mathewson/Citadel.git',
    requirement: { kind: 'revision', revision: 'e4ba6d5bedf1ac84c5a64331ad15f0f1c205c60f' },
    products: ['Citadel']
  )

  
  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
