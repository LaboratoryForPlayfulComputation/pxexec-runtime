pipeline {
  agent {
    docker {
      image 'node-ts3:latest'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install && tsc'
      }
    }
  }
}