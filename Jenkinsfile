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
        archiveArtifacts 'built/lib/**/.*s'
      }
    }
  }
}