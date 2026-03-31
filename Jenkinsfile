pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Repository checkout basliyor...'
                checkout scm
            }
        }

        stage('Backend Install') {
            steps {
                dir('server') {
                    echo 'Backend dependencies kuruluyor...'
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Frontend Install') {
            steps {
                dir('client') {
                    echo 'Frontend dependencies kuruluyor...'
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('client') {
                    echo 'Frontend build aliniyor...'
                    sh 'npm run build'
                }
            }
        }

        stage('CI Summary') {
            steps {
                echo 'Jenkins CI pipeline basariyla tamamlandi.'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Pipeline tamamlandi.'
        }
        failure {
            echo 'FAILURE: Loglari kontrol et.'
        }
        always {
            cleanWs()
        }
    }
}