package com.kob.backend.controller.pk;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

/**
 * @author wellorbetter
 * @since 2024/7/19 23:14
 */

@RestController
@RequestMapping("/pk/")
public class BotInfoController {
    @RequestMapping("getbotinfo/")
    public HashMap<String, String> getBotInfo() {
        HashMap<String, String> botInfo = new HashMap<>();
        botInfo.put("name", "KOB");
        botInfo.put("rating", "1000");
        return botInfo;
    }
}
