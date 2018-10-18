pipeline {
  agent {
    docker {
      image 'node:8.12.0-stretch'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install -g typescript'
        sh 'npm install && tsc'
      }
    }
    stage('Package') {
      steps {
        sh 'cd built && tar cvzf pxexec-runtime.tar.gz lib/**/*.*s*'
        archiveArtifacts 'built/pxexec-runtime.tar.gz'
      }
    }
  }
}