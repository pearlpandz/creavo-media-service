pipeline {
    agent any

    /* =========================
       BUILD PARAMETERS (UI)
       ========================= */
    parameters {
        choice(
            name: 'ENV',
            choices: ['dev', 'prod'],
            description: 'Select deployment environment'
        )
    }

    /* =========================
       GLOBAL VARIABLES
       ========================= */
    environment {
        APP_NAME    = 'creavo-media-service'
        DEPLOY_BASE = "/var/www/${ENV}/backend/media-service"
        RELEASES    = "${DEPLOY_BASE}/releases"
        CURRENT     = "${DEPLOY_BASE}/current"
        SHARED      = "${DEPLOY_BASE}/shared"
    }

    stages {

        /* =========================
           CHECKOUT
           ========================= */
        stage('Checkout') {
            steps {
                checkout scm
                echo "✔️ Source code checked out"
            }
        }

        /* =========================
           PREPARE RELEASE
           ========================= */
        stage('Prepare Release') {
            steps {
                script {
                    env.RELEASE_NAME = sh(
                        script: "date +%Y-%m-%d_%H%M%S",
                        returnStdout: true
                    ).trim()
                }

                sh """
                mkdir -p ${RELEASES}/${RELEASE_NAME}
                rsync -a --delete ./ ${RELEASES}/${RELEASE_NAME}/
                """
                echo "✔️ Release prepared: ${RELEASE_NAME}"
            }
        }

        /* =========================
           INSTALL DEPENDENCIES
           ========================= */
        stage('Install Dependencies') {
            steps {
                sh """
                cd ${RELEASES}/${RELEASE_NAME}
                npm ci --omit=dev
                """
                echo "✔️ Dependencies installed"
            }
        }

        /* =========================
           SYMLINK SHARED FILES
           ========================= */
        stage('Link Shared Resources') {
            steps {
                sh """
                ln -sfn ${SHARED}/uploads ${RELEASES}/${RELEASE_NAME}/uploads
                """
                echo "✔️ Shared uploads linked"
            }
        }

        /* =========================
           PM2 DEPLOY
           ========================= */
        stage('PM2 Deploy') {
            steps {
                script {
                    echo "🚀 Deploying to environment: ${params.ENV}"

                    def pm2Cmd = "pm2 startOrReload ecosystem.config.js"

                    // Only include prod flag when ENV=prod
                    if (params.ENV == 'prod') {
                        pm2Cmd += " --env production"
                    }

                    pm2Cmd += " --update-env"

                    sh """
                    ln -sfn ${RELEASES}/${RELEASE_NAME} ${CURRENT}
                    cd ${CURRENT}

                    ${pm2Cmd}
                    pm2 save
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful (${params.ENV})"
        }
        failure {
            echo "❌ Deployment failed (${params.ENV})"
        }
    }
}
