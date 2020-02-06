import { throws } from 'assert';
import { expect } from 'chai';
import 'mocha';
import { Tracery } from '../Tracery';

describe('Tracery3', () => {
	it('Should interpolate', () => {
		const result = Tracery.generate(
			{
				origin: 'Test #other#',
				other: 'test',
			},
			'origin'
		);

		expect(result).to.equal('Test test');
	});

	it('Should pluralize', () => {
		const result = Tracery.generate(
			{
				origin: 'Test #other.s#',
				other: 'test',
			},
			'origin'
		);

		expect(result).to.equal('Test tests');
	});

	it('Should remember', () => {
		const result = Tracery.generate(
			{
				origin: '[thing:#other#]#test#',
				test: '#thing# #thing#',
				other: [
					'1',
					'2',
					'3',
					'4',
					'5',
					'6',
					'7',
					'8',
					'9',
					'10',
					'11',
					'12',
					'13',
					'14',
					'15',
					'16',
				],
			},
			'origin'
		);

		expect(result).to.match(/^(\d+) \1$/);
	});

	it('Should work with objects', () => {
		const result = Tracery.generate(
			{
				origin: '#user.name#',
				user: {
					name: 'freddy',
				},
			},
			'origin'
		);

		expect(result).to.equal('freddy');
	});

	it('Should reduce objects by following properties and function return values', () => {
		const result = Tracery.generate(
			{
				origin: '#user.get.name#',
				user: [
					{
						get: (): unknown => ({
							name: 'teddy',
						}),
					},
				],
			},
			'origin'
		);

		expect(result).to.equal('teddy');
	});

	it('Should do many things at once', () => {
		const result = Tracery.generate(
			{
				origin:
					'[animal:#animal#][adjective:#adjective#]The #adjective# #animal# is #adjective.a# #animal#',
				animal: ['dog', 'cat'],
				adjective: ['smelly', 'tall', 'aerobic'],
			},
			'origin'
		);

		expect(result).to.match(/^The (\w+) (\w+) is an? \1 \2$/);
	});

	it('Should not work with unclosed #', () => {
		throws(
			() => {
				Tracery.generate({ origin: 'this is #half' }, 'origin');
			},
			(e: Error) => {
				return /^Unclosed # in/.test(e.message);
			}
		);
	});

	it('Should not work with nested assignments', () => {
		throws(
			() => {
				Tracery.generate(
					{
						origin:
							'this is [what:stuff[inside:things] #inside#]half',
						thing: 'abcd',
					},
					'origin'
				);
			},
			(e: Error) => {
				return /^Don't nest variable assignments/.test(e.message);
			}
		);
	});

	it('Should fail if modifiers attempt to access missing properties on an object', () => {
		throws(
			() => {
				Tracery.generate(
					{
						origin: '#user.name#',
						user: {
							nothing: 'to see here',
						},
					},
					'origin'
				);
			},
			(e: Error) => {
				return /^Missing property "name"/.test(e.message);
			}
		);
	});

	it("Should fail if objects aren't reduced to a string or number", () => {
		throws(
			() => {
				Tracery.generate(
					{
						origin: 'My #object#',
						object: { subProperty: 'things' },
					},
					'origin'
				);
			},
			(e: Error) => {
				return /^Object could not be reduced to string or number/.test(
					e.message
				);
			}
		);
	});
});
