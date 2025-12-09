import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { saveLLMFixture, loadLLMFixture } from './saveFixture'
import * as fs from 'fs'
import * as path from 'path'

// ファイルシステム操作をモック
vi.mock('fs')

describe('saveFixture', () => {
  const mockFixturePath = path.join(process.cwd(), 'lib', 'llm', 'testFixtures', 'testFixture.json')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveLLMFixture', () => {
    it('LLMレスポンスをtestFixture.jsonに保存する', () => {
      const inputText = 'test article'
      const rawOutput = '{"result": "data"}'

      saveLLMFixture(inputText, rawOutput, 'gpt-4o-mini')

      expect(fs.existsSync).toHaveBeenCalled()
      expect(fs.mkdirSync).toHaveBeenCalled()
      expect(fs.writeFileSync).toHaveBeenCalled()
    })

    it('常に同じファイル名 testFixture.json に上書き保存する', () => {
      const inputText = 'article 1'
      const rawOutput = '{"data": 1}'

      saveLLMFixture(inputText, rawOutput)

      const calls = (fs.writeFileSync as any).mock.calls
      expect(calls.some((call: any) => call[0].includes('testFixture.json'))).toBe(true)
    })

    it('フィクスチャに正しいメタデータを含める', () => {
      const inputText = 'test'
      const rawOutput = '{"test": true}'

      saveLLMFixture(inputText, rawOutput, 'gpt-4o-mini')

      const writeCall = (fs.writeFileSync as any).mock.calls[0]
      const savedData = JSON.parse(writeCall[1])

      expect(savedData).toHaveProperty('timestamp')
      expect(savedData).toHaveProperty('inputHash')
      expect(savedData).toHaveProperty('rawOutput', rawOutput)
      expect(savedData).toHaveProperty('model', 'gpt-4o-mini')
    })

    it('同じ入力テキストに対して同じハッシュを生成する', () => {
      const inputText = 'same input'

      saveLLMFixture(inputText, '{"data": 1}')
      const call1 = (fs.writeFileSync as any).mock.calls[0]
      const hash1 = JSON.parse(call1[1]).inputHash

      vi.clearAllMocks()

      saveLLMFixture(inputText, '{"data": 2}')
      const call2 = (fs.writeFileSync as any).mock.calls[0]
      const hash2 = JSON.parse(call2[1]).inputHash

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(8)
    })

    it('異なる入力テキストに対して異なるハッシュを生成する', () => {
      saveLLMFixture('input1', '{"data": 1}')
      const call1 = (fs.writeFileSync as any).mock.calls[0]
      const hash1 = JSON.parse(call1[1]).inputHash

      vi.clearAllMocks()

      saveLLMFixture('input2', '{"data": 1}')
      const call2 = (fs.writeFileSync as any).mock.calls[0]
      const hash2 = JSON.parse(call2[1]).inputHash

      expect(hash1).not.toBe(hash2)
    })

    it('ディレクトリが存在しない場合は作成する', () => {
      ;(fs.existsSync as any).mockReturnValue(false)

      saveLLMFixture('test', '{"data": true}')

      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('testFixtures'), { recursive: true })
    })

    it('ファイルシステムエラーを静かに処理する', () => {
      ;(fs.writeFileSync as any).mockImplementation(() => {
        throw new Error('EACCES: permission denied')
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = saveLLMFixture('test', '{"data": true}')

      expect(consoleSpy).toHaveBeenCalled()
      expect(result).toBe('testFixture.json')

      consoleSpy.mockRestore()
    })

    it('返り値としてファイル名を返す', () => {
      const result = saveLLMFixture('test', '{"data": true}')
      expect(result).toBe('testFixture.json')
    })
  })

  describe('loadLLMFixture', () => {
    it('テスト用フィクスチャから出力を読み込む', () => {
      const mockFixture = {
        timestamp: '2025-12-09T00:00:00Z',
        inputHash: 'abc12345',
        rawOutput: '{"result": "data"}',
        model: 'gpt-4o-mini',
      }

      ;(fs.existsSync as any).mockReturnValue(true)
      ;(fs.readFileSync as any).mockReturnValue(JSON.stringify(mockFixture))

      const result = loadLLMFixture('testFixture')

      expect(result).toEqual(mockFixture)
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('testFixture.json'), 'utf-8')
    })

    it('フィクスチャが存在しない場合はnullを返す', () => {
      ;(fs.existsSync as any).mockReturnValue(false)

      const result = loadLLMFixture('nonexistent')

      expect(result).toBeNull()
    })

    it('読み込みエラーを処理する', () => {
      ;(fs.existsSync as any).mockReturnValue(true)
      ;(fs.readFileSync as any).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = loadLLMFixture('testFixture')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('デフォルトでtestFixtureを読み込む', () => {
      ;(fs.existsSync as any).mockReturnValue(true)
      ;(fs.readFileSync as any).mockReturnValue('{}')

      loadLLMFixture()

      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('testFixture.json'), 'utf-8')
    })

    it('JSONパースエラーを処理する', () => {
      ;(fs.existsSync as any).mockReturnValue(true)
      ;(fs.readFileSync as any).mockReturnValue('invalid json {')

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = loadLLMFixture()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
