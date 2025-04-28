/* groovylint-disable NestedBlockDepth */
pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('9c279da9-7de8-424f-8407-61975581cd85')
        GIT_BRANCH = 'main'
        APP_IMAGE = 'textures1245/simple-user-api'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        GIT_REPO = 'https://github.com/textures1245/simple-user-api.git'
    }

    stages {
        stage('Check Credentials') {
            steps {
                script {
                    if (DOCKERHUB_CREDENTIALS == null) {
                        error('Docker Hub credentials not found.')
                    }

                }
            }
        }

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: "${GIT_BRANCH}"]],
                    userRemoteConfigs: [[url: '${GIT_REPO}']])
                ])
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(APP_IMAGE, '--build-arg BUILD_NUMBER=${env.BUILD_NUMBER} .')
                }
            }
        }

       stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v2/', DOCKERHUB_CREDENTIALS) {
                        docker.image("${APP_IMAGE}:${IMAGE_TAG}").push()
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker rmi -f ${APP_IMAGE}:${IMAGE_TAG}'
                junit '**/test-results/*.xml'
            }
        }
        success {
            echo 'Build and push succeeded!'
        }
        failure {
            echo 'Build or push failed.'
        }
    }
}
