# Backend CI/CD Pipeline with AWS EC2 & GitHub Actions 🚀

This document outlines the complete process for setting up an automated CI/CD pipeline for our Node.js backend. The pipeline uses **GitHub Actions** to automatically deploy the latest changes to an **AWS EC2 instance**, where the application is managed by **PM2**.



---

## 1. AWS EC2 Instance Setup ☁️

First, we need a server to host our application.

### Step 1: Create and Configure EC2 Instance
1.  Navigate to the **AWS EC2 console** and click **"Launch instances"**.
2.  Choose an Amazon Machine Image (AMI), such as **Ubuntu**.
3.  Select an instance type (e.g., `t2.micro` for the free tier).
4.  Create a new **key pair**.
    * Select **RSA** for the type and **.pem** for the file format.
    * Download the `.pem` file and store it securely. This is your private key.
5.  In **Network settings**, create a security group and configure the inbound rules:
    * Allow **SSH** (Port 22) from your IP for secure access.
    * Allow **Custom TCP** on port **8080** (or your backend's port) from `Anywhere` (0.0.0.0/0). This allows your backend API to be accessed.
    * Allow **HTTP** on port **80** from `Anywhere` (0.0.0.0/0). This will be used later.
6.  Launch the instance!



### Step 2: Connect and Prepare the Server
1.  Open a terminal in the directory where you saved your `.pem` key file.
2.  Restrict the key file's permissions to make it secure.
    ```bash
    chmod 400 “ApnaAI.pem"
    ```
3.  Connect to your EC2 instance using SSH. You can find the command in the EC2 "Connect" section.
    ```bash
    ssh -i "ApnaAI.pem"ubuntu@ec2-54-210-6-159.compute-1.amazonaws.com
    ```
4.  Once connected, update the server's package manager.
    ```bash
    sudo apt update
    ```
5.  Install **Node.js**, **npm**, **PM2** (a process manager for Node.js), and **Nginx**.
    ```bash
    # Install Node.js and npm
    sudo apt install nodejs npm

    # Install PM2 globally
    sudo npm install -g pm2

    # Install Nginx
    sudo apt install nginx
    ```

---

## 2. GitHub Actions Self-Hosted Runner Setup 🏃‍♂️

We need to connect our EC2 instance to GitHub so it can run our deployment jobs.

1.  In your backend GitHub repository, go to **Settings > Actions > Runners**.
2.  Click **"New self-hosted runner"**.
3.  Choose **Linux** as the image.
4.  Follow the commands provided by GitHub to set up the runner on your EC2 instance. These commands will look like this:
    ```bash
    # Create a folder for the runner
    mkdir backend-runner && cd backend-runner

    # Download the runner package
    curl -o actions-runner-linux-x64-2.328.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.328.0/actions-runner-linux-x64-2.328.0.tar.gz

    # Optional: Validate the hash
    echo "01066fad3a2893e63e6ca880ae3a1fad5bf9329d60e77ee15f2b97c148c3cd4e  actions-runner-linux-x64-2.328.0.tar.gz" | shasum -a 256 -c

    # Extract the installer
    tar xzf ./actions-runner-linux-x64-2.328.0.tar.gz

    # Configure the runner (use the URL and token from your repo's settings)
    ./config.sh --url https://github.com/SurjeetKumar1/Apna-AI-Backend --token BCKCEMRKGHGZ3PJGHSZRWPDIWKWAW

    # Install the runner as a service to run on startup
    sudo ./svc.sh install

    # Start the runner service
    sudo ./svc.sh start
    ```
    Your EC2 instance is now listening for jobs from your GitHub repository!

---

## 3. GitHub Actions Workflow Configuration ⚙️

This is the automated script that will run every time you push code.

1.  In your repository, create a directory `.github/workflows`.
2.  Inside it, create a file named `cicd.yml`.
3.  Paste the following code into `cicd.yml`:

   ```# 
    name: Node.js CI

    on:
      push:
        branches: [ "main" ]

jobs:
  build:

    runs-on: self-hosted

    strategy:
      matrix:
        node-version: [23.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    - name: Backup .env
      run : |
       if [ -f .env ]; then mv .env /tmp/env_backup; fi
    - uses: actions/checkout@v4
    - name: Restore .env
      run : |
       if [ -f /tmp/env_backup ]; then mv /tmp/env_backup .env; fi
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build --if-present
    - run: sudo pm2 restart backend  
    
    # - run: npm test
    ```

### Handling the `.env` file
The workflow includes steps to back up and restore your `.env` file. You must create the `.env` file on the server manually the first time.

1.  SSH into your EC2 instance.
2.  Navigate to the directory where your code will be checked out:
    `cd ~/backend-runner/_work/your-repo-name/your-repo-name`
3.  Create and edit the `.env` file.
    ```bash
    nano .env
    ```
4.  Add your environment variables (e.g., `MONGO_URI=...`, `JWT_SECRET=...`) and save the file.

---

## 4. Verification ✅

After pushing a change to the `main` branch, the GitHub Action will trigger.
You can verify that the deployment was successful by accessing your API endpoint:

`(https://ec2-54-210-6-159.compute-1.amazonaws.com:8080/test)`

You should see the response from your backend!
