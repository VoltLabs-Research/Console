import { useRef } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import './CodeInput.css';

export interface CodeInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    groupSize?: number;
    ariaLabel?: string;
}

const sanitize = (raw: string): string => raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

const CodeInput = ({
    value,
    onChange,
    length = 8,
    groupSize,
    ariaLabel = 'Verification code'
}: CodeInputProps) => {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const chars = Array.from({ length }, (_, index) => value[index] ?? '');

    const focusAt = (index: number): void => {
        const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
        target?.focus();
        target?.select();
    };

    const setCharAt = (index: number, char: string): void => {
        const next = chars.slice();
        next[index] = char;
        onChange(next.join('').slice(0, length));
    };

    const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>): void => {
        const typed = sanitize(event.target.value);
        if (!typed) {
            setCharAt(index, '');
            return;
        }

        if (typed.length > 1) {
            const next = chars.slice();
            let cursor = index;
            for (const char of typed) {
                if (cursor >= length) {
                    break;
                }
                next[cursor] = char;
                cursor += 1;
            }
            onChange(next.join('').slice(0, length));
            focusAt(cursor);
            return;
        }

        setCharAt(index, typed);
        focusAt(index + 1);
    };

    const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Backspace') {
            if (chars[index]) {
                setCharAt(index, '');
                return;
            }
            event.preventDefault();
            setCharAt(index - 1, '');
            focusAt(index - 1);
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusAt(index - 1);
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusAt(index + 1);
        }
    };

    const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>): void => {
        event.preventDefault();
        const pasted = sanitize(event.clipboardData.getData('text'));
        if (!pasted) {
            return;
        }

        const next = chars.slice();
        let cursor = index;
        for (const char of pasted) {
            if (cursor >= length) {
                break;
            }
            next[cursor] = char;
            cursor += 1;
        }
        onChange(next.join('').slice(0, length));
        focusAt(cursor);
    };

    return (
        <div className='code-input' role='group' aria-label={ariaLabel}>
            {chars.map((char, index) => {
                const startsNewGroup = groupSize ? index > 0 && index % groupSize === 0 : false;

                return (
                    <input
                        key={index}
                        ref={(element) => {
                            inputsRef.current[index] = element;
                        }}
                        className={startsNewGroup ? 'code-input__box code-input__box--group-start' : 'code-input__box'}
                        type='text'
                        inputMode='text'
                        autoComplete='off'
                        autoCapitalize='characters'
                        spellCheck={false}
                        maxLength={1}
                        value={char}
                        aria-label={`${ariaLabel} character ${index + 1}`}
                        onChange={handleChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        onPaste={handlePaste(index)}
                        onFocus={(event) => event.target.select()}
                    />
                );
            })}
        </div>
    );
};

export default CodeInput;
