export default [
    {
        input: 'scalar:@usagilab/leporidae',
        output: {
            fileName: 'leporidae',
            indexFile: false,
            clean: false,
            path: 'shared/types',
            postProcess: [{
                command: 'pnpm',
                args: ['lint:fix'],
            }],
        },
        plugins: [{
            name: '@hey-api/typescript',
        }],
    },
]
