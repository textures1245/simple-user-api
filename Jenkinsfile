pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('9c279da9-7de8-424f-8407-61975581cd85')
        GIT_BRANCH = 'main'
        APP_IMAGE = 'simple-user-api-app'
        IMAGE_TAG = "app-v1-id-${env.BUILD_NUMBER}"
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
                checkout([$class: 'GitSCM',
                    branches: [[name: "${GIT_BRANCH}"]],
                    userRemoteConfigs: [[url: "${GIT_REPO}"]]
                ])
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${APP_IMAGE}:${IMAGE_TAG} --build-arg BUILD_NUMBER=${env.BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                sh "docker tag ${APP_IMAGE}:${IMAGE_TAG} ${DOCKERHUB_CREDENTIALS_USR}/${APP_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${DOCKERHUB_CREDENTIALS_USR}/${APP_IMAGE}:${IMAGE_TAG}"
                sh 'docker logout'
            }
        }
    }

    post {
        always {
            script {
                sh "docker rmi -f ${APP_IMAGE}:${IMAGE_TAG} || true"
                sh "docker rmi -f ${DOCKERHUB_CREDENTIALS_USR}/${APP_IMAGE}:${IMAGE_TAG} || true"
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
                }
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
