
export interface FnMock {
	calls: {
		args: any[]
		returned: any
	}[]
}

export function fn<F extends (...args: any[]) => any>(
	actual = <F>(() => {})
) {
	function funny(...args: any[]): any {
		const returned = actual(...args)
		funny.mock.calls.push({args, returned})
		return returned
	}
	funny.mock = <FnMock>{calls: []}
	return <F & {mock: FnMock}>funny
}

export function defined(x: any) {
	return (x !== undefined && x !== null)
		? true
		: false
}
