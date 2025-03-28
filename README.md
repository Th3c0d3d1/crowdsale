# Next Gen ICO Crowdsale Project

Welcome to the Next Gen ICO Crowdsale Project! This repository contains a full-stack blockchain application that demonstrates the deployment and interaction with a token crowdsale smart contract on the Ethereum blockchain.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Testing](#testing)
- [Scripts](#scripts)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This project showcases a decentralized application (dApp) for conducting an Initial Coin Offering (ICO). It includes a smart contract for a custom ERC-20 token and a crowdsale contract, along with a React-based frontend for user interaction. The project is built using Solidity, Hardhat, and React.

## Features

- **ERC-20 Token**: A custom token with transfer, approval, and allowance functionalities.
- **Crowdsale Contract**: A smart contract for managing token sales, including whitelist functionality and price updates.
- **Frontend Integration**: A React application to interact with the deployed contracts.
- **Testing**: Comprehensive unit tests for the smart contracts.

## Project Structure
.
├── .env
├── .gitignore
├── contracts/
│ ├── Crowdsale.sol
│ └── Token.sol
├── hardhat.config.js
├── ignition/
│ └── modules/
│ └── Lock.js
├── package.json
├── public/
│ ├── index.html
│ ├── manifest.json
│ └── robots.txt
├── scripts/
│ └── deploy.js
├── src/
│ ├── abis/
│ │ ├── Crowdsale.json
│ │ └── Token.json
│ ├── components/
│ │ ├── App.js
│ │ ├── Buy.js
│ │ ├── Info.js
│ │ ├── Loading.js
│ │ ├── Nav.js
│ │ └── Progress.js
│ ├── config.json
│ ├── index.css
│ ├── index.js
│ └── reportWebVitals.js
├── test/
│ └── Crowdsale.js
└── README.md


## Setup Instructions

1. **Clone the repository**: git clone https://github.com/Th3c0d3d1/crowdsale.git


2. **Install dependencies**: npm install


3. **Set up environment variables**:
Create a `.env` file in the root directory and add the following: ALCHEMY_API_KEY=your-alchemy-api-key PRIVATE_KEYS=your-private-keys


## Deployment

1. **Compile the contracts**: npx hardhat compile


2. **Deploy the contracts**: npx hardhat run deploy.js --network sepolia


## Testing

1. **Run the tests**: npx hardhat test


## Scripts

- **Start the React app**: npm run start


- **Build the React app**: npm run build


- **Run tests**: npm test


## Technologies Used

- **Solidity**: Smart contract programming language.
- **Hardhat**: Ethereum development environment.
- **React**: JavaScript library for building user interfaces.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **Chai**: Assertion library for testing.

## Contributing

Contributions to this project are welcome. Please fork the repository and submit pull requests for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.