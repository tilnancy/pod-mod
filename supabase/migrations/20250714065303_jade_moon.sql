@@ .. @@
 -- Insert the OpenAI API key
 INSERT INTO api_keys (key_name, key_value)
-VALUES ('openai', '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')
+VALUES ('openai', 'YOUR_OPENAI_API_KEY_HERE')
 ON CONFLICT (key_name) DO UPDATE
 SET key_value = EXCLUDED.key_value;