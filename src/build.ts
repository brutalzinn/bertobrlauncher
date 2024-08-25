import { execSync } from 'child_process';

const build = () => {
    try {
        console.log('Starting build process...');

        // Compile TypeScript files
        console.log('Compiling TypeScript...');
        execSync('tsc', { stdio: 'inherit' });

        // Clear prisma database
        console.log('Clear prisma db 🚯')
        execSync('npx prisma migrate reset --force')

        // Build Electron app
        console.log('Building Electron app...');
        execSync('electron-builder', { stdio: 'inherit' });

        console.log('Build process completed successfully.');
    } catch (error) {
        console.error('Error during build process:', error);
        process.exit(1);
    }
};

// Execute build function
build();
