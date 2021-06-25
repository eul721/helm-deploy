import { sortPairFromInput } from './pagination';

describe('/src/utils/pagination', () => {
  describe('#sortPairFromInput', () => {
    describe('when provided empty or missing inputs', () => {
      test.each`
        input        | result
        ${undefined} | ${undefined}
        ${''}        | ${undefined}
      `('it should return "$result" when input is "$input"', ({ input, result }) => {
        expect(sortPairFromInput(input)).toEqual(result);
      });
    });

    describe('when provided semantically valid inputs', () => {
      test.each`
        input        | result
        ${'id.ASC'}  | ${'[["id", "ASC"]]'}
        ${'id.DESC'} | ${'[["id", "DESC"]]'}
        ${'id'}      | ${'[["id", "DESC"]]'}
      `('it should return "$result" when input is "$input"', ({ input, result }) => {
        // Note: to support printing input/output nicely, use a stringified JSON object as $result
        expect(sortPairFromInput(input)).toEqual(JSON.parse(result));
      });
    });

    describe('when provided invalid inputs', () => {
      test.each`
        input
        ${'DESC.id'}
        ${'energy.DESC'}
        ${'hello'}
        ${'id.NOPE'}
        ${'null'}
        ${'undefined'}
        ${{ foo: 'bar' }}
        ${'id.ASC,id.DESC'}
        ${'id.DESC,id.DESC'}
        ${'id.DESC,id.ASC'}
        ${'id.ASC,'}
      `('it should reject "$input" by throwing an "Invalid Input" error', ({ input }) => {
        expect(() => sortPairFromInput(input)).toThrow('Invalid Input');
      });
    });
  });
});
